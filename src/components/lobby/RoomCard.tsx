import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, IndianRupee, Users, ChevronDown, ChevronUp, Clock, Trophy, Crown } from 'lucide-react';
import type { Room } from '../../types/room';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface RoomCardProps {
  room: Partial<Room>;
  currentUserId?: string;
}

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

export default function RoomCard({ room, currentUserId }: RoomCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Partial<Room>>(room);
  const [joining, setJoining] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!room.id) return;

    // Subscribe to room updates
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
      // Check if room is full
      const playerCount = currentRoom.players?.length ?? 0;
      const maxPlayers = currentRoom.maxPlayers ?? 4;
      
      if (playerCount >= maxPlayers) {
        toast.error('Room is full');
        return;
      }

      // Join room
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
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`bg-white shadow-lg rounded-lg overflow-hidden border transition-all duration-300
        ${isFull ? 'border-red-500/50' : isHovered ? 'border-indigo-500 shadow-xl' : 'border-gray-200'}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-gray-900">{currentRoom.name ?? 'Unnamed Room'}</h3>
              {startingSoon && (
                <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-600 rounded-full">
                  Starting Soon
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-yellow-500">
                <Crown className="w-4 h-4" />
                <span className="ml-1 text-sm">{currentRoom.hostRating ?? 0}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className={`text-gray-400 hover:text-gray-500 transition-transform duration-200
              ${expanded ? 'rotate-180' : ''}`}
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1 text-gray-900">
            <IndianRupee className="w-4 h-4" />
            <span>₹{currentRoom.ticketPrice ?? 0}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Users className="w-4 h-4" />
            <span>{playerCount}/{maxPlayers}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{timeUntilStart()}</span>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <h4 className="text-sm font-medium text-gray-900">Prize Distribution</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(currentRoom.prizes ?? defaultPrizes)
                    .filter(([type]) => type !== 'earlyFive' || (currentRoom.prizes as any)?.earlyFive)
                    .map(([type, amount]) => (
                    <div 
                      key={type} 
                      className={`flex items-center justify-between rounded p-2
                        ${amount > 0 ? 'bg-indigo-50' : 'bg-gray-50'}`}
                    >
                      <span className="text-sm text-gray-600">
                        {prizeNames[type as keyof typeof prizeNames]}
                      </span>
                      <span className={`text-sm font-medium ${amount > 0 ? 'text-indigo-600' : 'text-gray-900'}`}>
                        ₹{amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-indigo-600">
              Total Prize: ₹{totalPrize}
            </span>
            {isFull && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                Full
              </span>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleJoinRoom}
            disabled={joining || isFull || !currentRoom.id}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
              ${
                !currentRoom.id || isFull
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : joining
                  ? 'bg-indigo-100 text-indigo-400 cursor-wait'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }
            `}
          >
            {joining ? 'Joining...' : isFull ? 'Room Full' : 'Join Room'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}