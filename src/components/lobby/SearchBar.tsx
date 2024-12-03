import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, Loader2, IndianRupee, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth/AuthContext';
import toast from 'react-hot-toast';
import type { Room } from '../../types/room';

interface SearchBarProps {
  onRoomsChange: (rooms: Room[]) => void;
}

interface RoomFilters {
  category: string;
  priceRange: [number, number];
  startTime: string;
  maxPlayers: number;
}

const defaultFilters: RoomFilters = {
  category: 'all',
  priceRange: [0, 1000],
  startTime: 'any',
  maxPlayers: 4,
};

export default function SearchBar({ onRoomsChange }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<RoomFilters>(defaultFilters);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Handle search query debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchRooms = useCallback(async () => {
    if (!onRoomsChange || !user?.id) return;
    setLoading(true);

    try {
      let query = supabase
        .from('rooms')
        .select('*')
        .order('start_time', { ascending: true });

      // Apply text search
      if (debouncedQuery) {
        query = query.ilike('title', `%${debouncedQuery}%`);
      }

      // Apply category filter
      if (filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      // Apply price range filter
      query = query
        .gte('ticket_price', filters.priceRange[0])
        .lte('ticket_price', filters.priceRange[1]);

      // Apply start time filter
      if (filters.startTime !== 'any') {
        const now = new Date();
        let maxTime = new Date();
        
        switch (filters.startTime) {
          case '15min':
            maxTime.setMinutes(now.getMinutes() + 15);
            break;
          case '30min':
            maxTime.setMinutes(now.getMinutes() + 30);
            break;
          case '1hour':
            maxTime.setHours(now.getHours() + 1);
            break;
        }

        query = query
          .gte('start_time', now.toISOString())
          .lte('start_time', maxTime.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      onRoomsChange(data || []);
    } catch (error) {
      console.error('Error searching rooms:', error);
      toast.error('Failed to search rooms');
      onRoomsChange([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, filters, onRoomsChange, user?.id]);

  useEffect(() => {
    if (!user?.id) {
      onRoomsChange([]);
      return;
    }

    void searchRooms();
  }, [debouncedQuery, filters, user?.id, searchRooms, onRoomsChange]);

  const handleFilterChange = (newFilters: Partial<RoomFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="relative z-10">
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-gray-700">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games..."
              className="w-full bg-gray-900/50 text-gray-100 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-700 placeholder-gray-500"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            {loading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500 animate-spin" />
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl transition-colors ${
              showFilters ? 'bg-cyan-500 text-white' : 'bg-gray-900/50 text-gray-400 hover:text-gray-300 border border-gray-700'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </motion.button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 space-y-6"
            >
              {/* Price Range Filter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">Entry Fee Range</label>
                  <div className="flex items-center gap-1 text-cyan-500">
                    <IndianRupee className="w-4 h-4" />
                    <span className="text-sm">{filters.priceRange[0]} - {filters.priceRange[1]}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={filters.priceRange[0]}
                    onChange={(e) =>
                      handleFilterChange({
                        priceRange: [
                          Math.min(Number(e.target.value), filters.priceRange[1]),
                          filters.priceRange[1],
                        ],
                      })
                    }
                    className="w-full accent-cyan-500"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      handleFilterChange({
                        priceRange: [
                          filters.priceRange[0],
                          Math.max(Number(e.target.value), filters.priceRange[0]),
                        ],
                      })
                    }
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>

              {/* Start Time Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Time
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'any', label: 'Any Time' },
                    { value: '15min', label: '15 mins' },
                    { value: '30min', label: '30 mins' },
                    { value: '1hour', label: '1 hour' },
                  ].map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleFilterChange({ startTime: option.value })}
                      className={`p-2 rounded-lg text-sm flex items-center justify-center gap-2 ${
                        filters.startTime === option.value
                          ? 'bg-cyan-500 text-white'
                          : 'bg-gray-900/50 text-gray-400 hover:text-gray-300 border border-gray-700'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Max Players Filter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">Max Players</label>
                  <div className="flex items-center gap-1 text-cyan-500">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{filters.maxPlayers}</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={filters.maxPlayers}
                  onChange={(e) =>
                    handleFilterChange({ maxPlayers: Number(e.target.value) })
                  }
                  className="w-full accent-cyan-500"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}