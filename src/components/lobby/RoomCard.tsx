import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, IndianRupee, Users, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import type { Room } from '../../types/room';
import { motion, AnimatePresence } from 'framer-motion';

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    navigate(`/game/${room.id}`);
  };

  const timeUntilStart = () => {
    const startTime = new Date(room.startTime);
    const diff = startTime.getTime() - Date.now();
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };

  const totalPrize = Object.values(room.prizes).reduce((a, b) => a + b, 0);

  return (
    <motion.div 
      layout
      className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-cyan-500 transition-all duration-300"
    >
      {/* Main Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg text-white">{room.name}</h3>
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm">{room.hostRating}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-cyan-400 font-medium">
              <IndianRupee className="w-4 h-4" />
              <span>{room.ticketPrice}</span>
            </div>
            <p className="text-xs text-gray-400">per ticket</p>
          </div>
        </div>

        {/* Prize Pool */}
        <div className="bg-gray-700/50 rounded-lg p-3 mb-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-300">Total Prize Pool</p>
            <p className="text-lg font-bold text-green-400">₹{totalPrize}</p>
          </div>
        </div>

        {/* Game Info */}
        <div className="flex justify-between text-sm text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Starts in {timeUntilStart()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{room.players.length}/{room.maxPlayers}</span>
          </div>
        </div>

        {/* Player Avatars */}
        <div className="flex -space-x-2 mb-3">
          {room.players.slice(0, 5).map((player) => (
            <img
              key={player.id}
              src={player.avatar}
              alt="Player"
              className="w-8 h-8 rounded-full border-2 border-gray-800"
            />
          ))}
          {room.players.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-300 border-2 border-gray-800">
              +{room.players.length - 5}
            </div>
          )}
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" /> Prize details
            </>
          )}
        </button>
      </div>

      {/* Expandable Prize Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-700"
          >
            <div className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-400">Full House</span>
                <span className="text-white">₹{room.prizes.fullHouse}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-400">Top Line</span>
                <span className="text-white">₹{room.prizes.topLine}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-400">Middle Line</span>
                <span className="text-white">₹{room.prizes.middleLine}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-yellow-400">Bottom Line</span>
                <span className="text-white">₹{room.prizes.bottomLine}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join Button */}
      <button 
        onClick={handleJoinRoom}
        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 transition-colors flex items-center justify-center gap-2"
      >
        Join Room
        <Users className="w-4 h-4" />
      </button>
    </motion.div>
  );
}