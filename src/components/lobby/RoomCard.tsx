import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, IndianRupee, Users, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import type { Room } from '../../types/room';

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    navigate(`/game/${room.id}`);
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-cyan-500 transition-all duration-300">
      {/* Rest of the component remains the same until the join button */}
      <button 
        onClick={handleJoinRoom}
        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 transition-colors"
      >
        Join Room
      </button>
    </div>
  );
}