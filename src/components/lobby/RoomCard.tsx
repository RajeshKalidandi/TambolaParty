import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, IndianRupee, Users, ChevronDown, ChevronUp, Clock, Shield } from 'lucide-react';
import type { Room } from '../../types/room';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface RoomCardProps {
  room: Room;
  currentUserId?: string;
}

export default function RoomCard({ room, currentUserId }: RoomCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(room);
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
    if (joining) return;
    setJoining(true);

    try {
      // Check if room is full
      if (currentRoom.current_players >= currentRoom.max_players) {
        toast.error('Room is full');
        return;
      }

      // Check if room has started
      if (currentRoom.status !== 'waiting') {
        toast.error('Game has already started');
        return;
      }

      // Join room
      const { error } = await supabase
        .from('game_players')
        .insert({
          game_id: currentRoom.id,
          user_id: currentUserId,
          status: 'active'
        });

      if (error) throw error;

      // Increment player count
      const { error: updateError } = await supabase
        .from('rooms')
        .update({ current_players: currentRoom.current_players + 1 })
        .eq('id', currentRoom.id);

      if (updateError) throw updateError;

      navigate(`/game/${currentRoom.id}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast.error('Failed to join room');
    } finally {
      setJoining(false);
    }
  };

  const timeUntilStart = () => {
    const startTime = new Date(currentRoom.start_time);
    const diff = startTime.getTime() - Date.now();
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };

  const totalPrize = Object.values(currentRoom.prizes).reduce((a, b) => a + b, 0);
  const isFull = currentRoom.current_players >= currentRoom.max_players;
  const hasStarted = currentRoom.status !== 'waiting';

  return (
    <motion.div 
      layout
      className={`bg-gray-800 rounded-xl overflow-hidden border transition-all duration-300
        ${hasStarted ? 'border-yellow-500/50' : isFull ? 'border-red-500/50' : 'border-gray-700 hover:border-cyan-500'}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-100">{currentRoom.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{currentRoom.description}</p>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-gray-300"
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1 text-yellow-500">
            <IndianRupee className="w-4 h-4" />
            <span>{totalPrize}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Users className="w-4 h-4" />
            <span>{currentRoom.current_players}/{currentRoom.max_players}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
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
                <h4 className="text-sm font-medium text-gray-300">Prize Distribution</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(currentRoom.prizes).map(([type, amount]) => (
                    <div key={type} className="flex items-center justify-between bg-gray-700/50 rounded p-2">
                      <span className="text-sm text-gray-300">
                        {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                      <span className="text-sm text-yellow-500">₹{amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Rules</h4>
                <div className="space-y-1">
                  {Object.entries(currentRoom.rules).map(([rule, enabled]) => (
                    <div key={rule} className="flex items-center gap-2 text-sm">
                      <Shield className={`w-4 h-4 ${enabled ? 'text-green-500' : 'text-gray-500'}`} />
                      <span className="text-gray-300">
                        {rule.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-gray-700/30 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-cyan-400">
              Entry Fee: ₹{currentRoom.entry_fee}
            </span>
            {currentRoom.status !== 'waiting' && (
              <span className="px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 rounded">
                In Progress
              </span>
            )}
            {isFull && (
              <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded">
                Full
              </span>
            )}
          </div>
          <button
            onClick={handleJoinRoom}
            disabled={joining || isFull || hasStarted}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                isFull || hasStarted
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-cyan-600 text-white hover:bg-cyan-500'
              }
            `}
          >
            {joining ? 'Joining...' : 'Join Game'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}