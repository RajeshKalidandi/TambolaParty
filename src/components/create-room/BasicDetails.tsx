import React from 'react';
import DatePicker from 'react-datepicker';
import { motion } from 'framer-motion';
import { Users, Calendar, Hash, Zap, Crown, Lock, Sparkles, IndianRupee } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";
import { RoomFormData, RoomType } from '../../types/room-creation';

interface BasicDetailsProps {
  data: RoomFormData;
  onChange: (data: Partial<RoomFormData>) => void;
}

const ROOM_TYPES: Array<{
  type: RoomType;
  icon: typeof Zap;
  description: string;
  gradient: string;
  features: string[];
}> = [
  {
    type: 'Quick',
    icon: Zap,
    description: 'Fast-paced games',
    gradient: 'from-[#FF5722] to-[#FF8A65]',
    features: ['15-minute games', 'Quick prizes', 'Auto-number calling']
  },
  {
    type: 'Standard',
    icon: Hash,
    description: 'Classic experience',
    gradient: 'from-[#1A237E] to-[#3949AB]',
    features: ['30-minute games', 'Standard prizes', 'Manual number calling']
  },
  {
    type: 'Premium',
    icon: Crown,
    description: 'Enhanced prizes',
    gradient: 'from-[#FFD700] to-[#FFA000]',
    features: ['Higher prize pool', 'Premium features', 'Priority support']
  },
  {
    type: 'Private',
    icon: Lock,
    description: 'Invite-only games',
    gradient: 'from-purple-500 to-purple-700',
    features: ['Password protection', 'Invite links', 'Custom rules']
  }
];

export default function BasicDetails({ data, onChange }: BasicDetailsProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 p-6 rounded-2xl bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-white/10"
    >
      {/* Room Type */}
      <motion.div variants={item} className="relative space-y-2">
        <label className="block text-sm font-medium text-gray-200">
          Room Type
        </label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => {
              onChange({
                type: 'free',
                ticketPrice: 0,
                maxPlayers: 15,
                prizes: {
                  fullHouse: 0,
                  earlyFive: 0,
                  topLine: 0,
                  middleLine: 0,
                  bottomLine: 0
                }
              });
            }}
            className={`flex-1 py-2 px-4 rounded-lg border ${
              data.type === 'free'
                ? 'bg-green-500 border-green-400 text-white'
                : 'border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Free Room</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onChange({
              type: 'paid',
              ticketPrice: 100,
              maxPlayers: 50,
              prizes: {
                fullHouse: 0,
                earlyFive: 0,
                topLine: 0,
                middleLine: 0,
                bottomLine: 0
              }
            })}
            className={`flex-1 py-2 px-4 rounded-lg border ${
              data.type === 'paid'
                ? 'bg-indigo-500 border-indigo-400 text-white'
                : 'border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <IndianRupee className="w-4 h-4" />
              <span>Paid Room</span>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Room Name */}
      <motion.div variants={item} className="space-y-2">
        <label htmlFor="roomName" className="block text-sm font-medium text-gray-200">
          Room Name
        </label>
        <input
          type="text"
          id="roomName"
          value={data.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Enter a unique room name"
        />
      </motion.div>

      {/* Max Players */}
      <motion.div variants={item} className="space-y-2">
        <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-200">
          Maximum Players
        </label>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="number"
            id="maxPlayers"
            value={data.maxPlayers}
            onChange={(e) => onChange({ maxPlayers: parseInt(e.target.value) })}
            min={2}
            max={100}
            className="w-full pl-12 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </motion.div>

      {/* Start Time */}
      <motion.div variants={item} className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">
          Start Time
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <DatePicker
            selected={data.startTime}
            onChange={(date) => onChange({ startTime: date || new Date() })}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            minDate={new Date()}
            className="w-full pl-12 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white"
          />
        </div>
      </motion.div>

      {/* Ticket Price - Only show for paid rooms */}
      {data.type === 'paid' && (
        <motion.div variants={item} className="space-y-2">
          <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-200">
            Ticket Price (₹)
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="number"
              id="ticketPrice"
              value={data.ticketPrice}
              onChange={(e) => onChange({ ticketPrice: parseInt(e.target.value) })}
              min={10}
              className="w-full pl-12 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
