import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, IndianRupee, Users, ChevronDown, ChevronUp, Clock, Trophy, Crown } from 'lucide-react';
import type { Room } from '../../types/room';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const defaultPrizes = {
  fullHouse: 0,
  topLine: 0,
  middleLine: 0,
  bottomLine: 0,
  earlyFive: 0,
};

const prizeNames = {
  fullHouse: 'Full House',
  topLine: 'Top Line',
  middleLine: 'Middle Line',
  bottomLine: 'Bottom Line',
  earlyFive: 'Early Five',
};

interface RoomCardProps {
  room: Room;
  currentUserId?: string;
}

export default function RoomCard({ room, currentUserId }: RoomCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Partial<Room>>(room);
  const [joining, setJoining] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!room.id) return;

    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          setCurrentRoom(prev => ({ ...prev, ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id]);

  const handleJoinRoom = async () => {
    if (!currentRoom.id || !currentUserId || joining) return;
    setJoining(true);

    try {
      const playerCount = currentRoom.players?.length ?? 0;
      const maxPlayers = currentRoom.maxPlayers ?? 4;
      
      if (playerCount >= maxPlayers) {
        toast.error('Room is full');
        return;
      }

      const { error } = await supabase
        .from('room_players')
        .insert({
          room_id: currentRoom.id,
          player_id: currentUserId,
          payment_status: 'PENDING'
        });

      if (error) throw error;

      navigate(`/buy-tickets/${currentRoom.id}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Failed to join room');
    } finally {
      setJoining(false);
    }
  };

  const timeUntilStart = () => {
    if (!currentRoom.startTime) return 'TBD';
    const startTime = new Date(currentRoom.startTime);
    const diff = startTime.getTime() - Date.now();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 0) return 'Started';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  const totalPrize = Object.values(currentRoom.prizes ?? defaultPrizes).reduce((a, b) => a + b, 0);
  const playerCount = currentRoom.players?.length ?? 0;
  const maxPlayers = currentRoom.maxPlayers ?? 4;
  const isFull = playerCount >= maxPlayers;
  const startingSoon = timeUntilStart() !== 'TBD' && timeUntilStart() !== 'Started' && 
    parseInt(timeUntilStart()) < 15;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`bg-gray-800/50 backdrop-blur-lg rounded-2xl overflow-hidden border transition-all duration-300
        ${isFull ? 'border-red-500/50' : isHovered ? 'border-cyan-500 shadow-lg shadow-cyan-500/10' : 'border-gray-700'}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-white">{currentRoom.name ?? 'Unnamed Room'}</h3>
              {startingSoon && (
                <motion.span
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 text-xs font-semibold bg-green-500/10 text-green-400 rounded-full border border-green-500/20"
                >
                  Starting Soon
                </motion.span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center text-yellow-500">
                <Crown className="w-5 h-5" />
                <span className="ml-1.5 font-medium">{currentRoom.hostRating ?? 0}</span>
              </div>
              <span className="text-sm text-gray-400">
                Hosted by {currentRoom.host?.full_name ?? 'Unknown Host'}
              </span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-xl bg-gray-700/50 hover:bg-gray-700 transition-colors"
          >
            {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </motion.button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <IndianRupee className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Entry Fee</p>
                <p className="font-semibold text-white">₹{currentRoom.ticketPrice ?? 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Trophy className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Prize</p>
                <p className="font-semibold text-white">₹{totalPrize}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Clock className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Starts In</p>
                <p className="font-semibold text-white">{timeUntilStart()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 space-y-4"
            >
              {/* Prize Distribution */}
              <div className="bg-gray-900/50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Prize Distribution</h4>
                <div className="space-y-2">
                  {Object.entries(currentRoom.prizes ?? defaultPrizes).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">{prizeNames[key as keyof typeof prizeNames]}</span>
                      <span className="text-sm font-medium text-white">₹{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Players */}
              <div className="bg-gray-900/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-300">Players</h4>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">{playerCount}/{maxPlayers}</span>
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {Array.from({ length: Math.min(5, playerCount) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center"
                    >
                      <Users className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                  {playerCount > 5 && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center">
                      <span className="text-xs text-gray-400">+{playerCount - 5}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Join Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleJoinRoom}
          disabled={isFull || joining}
          className={`w-full mt-6 py-3 px-4 rounded-xl font-medium transition-all
            ${isFull 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25'
            }`}
        >
          {joining ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Joining...</span>
            </div>
          ) : isFull ? (
            'Room Full'
          ) : (
            'Join Game'
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}