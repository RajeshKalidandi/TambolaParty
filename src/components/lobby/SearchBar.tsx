import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import type { Room } from '../../types/room';
import { useAuth } from '../../lib/auth/AuthContext';

interface SearchBarProps {
  onRoomsChange: (rooms: Room[]) => void;
}

export interface RoomFilters {
  priceRange: [number, number];
  startTime: 'any' | '15min' | '30min' | '1hour';
  category: 'all' | 'quick' | 'tournament' | 'casual';
}

const defaultFilters: RoomFilters = {
  priceRange: [0, 1000],
  startTime: 'any',
  category: 'all',
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

  // Effect for searching when filters or debounced query changes
  useEffect(() => {
    if (!user?.id) {
      onRoomsChange([]);
      return;
    }

    void searchRooms();
  }, [debouncedQuery, filters, user?.id, searchRooms, onRoomsChange]);

  // Effect for real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('room-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
        },
        () => {
          void searchRooms();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id, searchRooms]);

  const handleFilterChange = (newFilters: Partial<RoomFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search games..."
            className="w-full bg-gray-800 text-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500 animate-spin" />
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg transition-colors ${
            showFilters ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-300'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 p-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10"
          >
            <div className="space-y-4">
              {/* Price Range Filter */}
              <div>
                <label className="text-sm font-medium text-gray-300">Entry Fee Range</label>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={filters.priceRange[0]}
                    onChange={(e) =>
                      handleFilterChange({
                        priceRange: [Number(e.target.value), filters.priceRange[1]],
                      })
                    }
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-400">₹{filters.priceRange[0]}</span>
                </div>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="10"
                    value={filters.priceRange[1]}
                    onChange={(e) =>
                      handleFilterChange({
                        priceRange: [filters.priceRange[0], Number(e.target.value)],
                      })
                    }
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-400">₹{filters.priceRange[1]}</span>
                </div>
              </div>

              {/* Start Time Filter */}
              <div>
                <label className="text-sm font-medium text-gray-300">Start Time</label>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {(['any', '15min', '30min', '1hour'] as const).map((time) => (
                    <button
                      key={time}
                      onClick={() => handleFilterChange({ startTime: time })}
                      className={`px-3 py-1 rounded text-sm ${
                        filters.startTime === time
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {time === 'any'
                        ? 'Any'
                        : time === '15min'
                        ? '15 mins'
                        : time === '30min'
                        ? '30 mins'
                        : '1 hour'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium text-gray-300">Category</label>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {(['all', 'quick', 'tournament', 'casual'] as const).map((category) => (
                    <button
                      key={category}
                      onClick={() => handleFilterChange({ category })}
                      className={`px-3 py-1 rounded text-sm capitalize ${
                        filters.category === category
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setFilters(defaultFilters);
                    setShowFilters(false);
                  }}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                  Reset Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}