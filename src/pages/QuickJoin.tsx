import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Star, Search, Users, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { RecentRoom, PopularHost } from '../types/room';

interface RoomData {
  id: string;
  room_code: string;
  name: string;
  host: {
    id: string;
    full_name: string;
    host_rating: number;
  } | null;
  ticket_price: number;
  start_time: string;
  room_players: Array<{ count: number }>;
}

export default function QuickJoin() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recentRooms, setRecentRooms] = useState<RecentRoom[]>([]);
  const [popularHosts, setPopularHosts] = useState<PopularHost[]>([]);

  useEffect(() => {
    loadRecentRooms();
    loadPopularHosts();
  }, []);

  const handleJoin = async (code: string) => {
    if (!code) {
      toast.error('Please enter a room code');
      return;
    }

    try {
      setIsLoading(true);
      const { data: room, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', code)
        .single();

      if (error) throw error;
      if (!room) throw new Error('Room not found');

      const startTime = new Date(room.start_time);
      if (startTime < new Date()) {
        toast.error('This game has already started');
        return;
      }

      navigate(`/room/${code}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentRooms = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('rooms')
        .select(`
          id,
          room_code,
          name,
          host:profiles!rooms_host_id_fkey(
            id,
            full_name,
            host_rating
          ),
          ticket_price,
          start_time,
          room_players(count)
        `)
        .gt('start_time', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      setRecentRooms((data as unknown as RoomData[]).map(room => ({
        id: room.id,
        code: room.room_code,
        name: room.name,
        hostName: room.host?.full_name || 'Unknown Host',
        ticketPrice: room.ticket_price,
        startTime: new Date(room.start_time),
        playerCount: room.room_players?.[0]?.count || 0
      })));
    } catch (error) {
      console.error('Error loading recent rooms:', error);
      toast.error('Failed to load recent rooms');
    }
  };

  const loadPopularHosts = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          host_rating,
          active_rooms:rooms(count),
          total_games_hosted
        `)
        .gt('host_rating', 4.0)
        .order('host_rating', { ascending: false })
        .limit(5);

      if (error) throw error;

      setPopularHosts(data.map(host => ({
        id: host.id,
        name: host.full_name || 'Anonymous',
        avatar: host.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${host.full_name}`,
        rating: host.host_rating || 0,
        activeRooms: host.active_rooms?.[0]?.count || 0,
        totalGamesHosted: host.total_games_hosted || 0
      })));
    } catch (error) {
      console.error('Error loading popular hosts:', error);
      toast.error('Failed to load popular hosts');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Room Code Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Join Game</h1>
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit Room Code"
              className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border-2 border-gray-200 
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 
                       focus:outline-none transition-all"
              maxLength={6}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleJoin(roomCode)}
              disabled={isLoading || !roomCode}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white 
                       px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 
                       transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Joining...' : 'Join'}
            </motion.button>
          </div>
        </motion.div>

        {/* Recent Rooms */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Rooms</h2>
            <span className="text-sm text-gray-500">{recentRooms.length} available</span>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {recentRooms.map((room, index) => (
                <motion.button
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleJoin(room.code)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-4 rounded-xl 
                           hover:bg-gray-50 transition-all border border-gray-100 
                           disabled:opacity-50 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                      <Clock className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">{room.name}</h3>
                      <p className="text-sm text-gray-500">by {room.hostName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-indigo-600">₹{room.ticketPrice}</p>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{room.playerCount}</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Popular Hosts */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Popular Hosts</h2>
            <span className="text-sm text-gray-500">{popularHosts.length} hosts</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {popularHosts.map((host, index) => (
              <motion.div
                key={host.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 
                         hover:border-indigo-100 hover:bg-indigo-50/20 transition-all"
              >
                <img
                  src={host.avatar}
                  alt={host.name}
                  className="w-12 h-12 rounded-full border-2 border-indigo-100"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{host.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium text-gray-700">{host.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{host.activeRooms} active</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      <span>{host.totalGamesHosted} total</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}