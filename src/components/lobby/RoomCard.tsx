import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, IndianRupee, Users, ChevronDown, ChevronUp, Clock, Trophy, Crown } from 'lucide-react';
import type { Room } from '../../types/room';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../lib/auth/AuthContext';

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
  const { user } = useAuth();

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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-cyan-500/50 transition-colors ${
        currentRoom.type === 'free' ? 'bg-green-500/20' : ''
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-white">{currentRoom.name}</h3>
            <p className="text-sm text-gray-400">Hosted by {currentRoom.host?.full_name}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                currentRoom.type === 'free'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : currentRoom.type === 'tournament'
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
              }`}
            >
              {currentRoom.type === 'free' ? 'Free Room' : currentRoom.type === 'tournament' ? 'Tournament' : 'Paid Room'}
            </span>
            {currentRoom.type !== 'free' && (
              <div className="flex items-center space-x-1 bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded-lg">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium">₹{totalPrize.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center text-gray-400">
            <Users className="w-4 h-4 mr-1" />
            <span>{playerCount}/{maxPlayers}</span>
          </div>
          {currentRoom.type !== 'free' && (
            <div className="flex items-center text-gray-400">
              <IndianRupee className="w-4 h-4 mr-1" />
              <span>₹{currentRoom.ticketPrice}</span>
            </div>
          )}
          <div className="flex items-center text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            <span>{timeUntilStart()}</span>
          </div>
        </div>
      </div>

      {/* Prize Distribution - Only for paid rooms */}
      {currentRoom.type !== 'free' && (
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 space-y-2"
            >
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Full House</span>
                <span className="text-white font-medium">₹{currentRoom.prizes?.fullHouse}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Early Five</span>
                <span className="text-white font-medium">₹{currentRoom.prizes?.earlyFive}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Lines</span>
                <span className="text-white font-medium">
                  ₹{currentRoom.prizes?.topLine + currentRoom.prizes?.middleLine + currentRoom.prizes?.bottomLine}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Join Button */}
      <div className="p-4 bg-gray-800/50">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleJoinRoom}
          disabled={isFull || joining}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isFull 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : startingSoon
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-cyan-500 hover:bg-cyan-600 text-white'
          }`}
        >
          {joining ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Joining...</span>
            </div>
          ) : isFull ? (
            'Room Full'
          ) : startingSoon ? (
            'Starting Soon'
          ) : (
            'Join Room'
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}