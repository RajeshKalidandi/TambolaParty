import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilterChange?: (filters: RoomFilters) => void;
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

export default function SearchBar({ value, onChange, onFilterChange }: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<RoomFilters>(defaultFilters);

  const handleFilterChange = (newFilters: Partial<RoomFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange?.(updatedFilters);
  };

  const categories = [
    { id: 'all', label: 'All Games' },
    { id: 'quick', label: 'Quick Games' },
    { id: 'tournament', label: 'Tournaments' },
    { id: 'casual', label: 'Casual' },
  ];

  const timeOptions = [
    { id: 'any', label: 'Any Time' },
    { id: '15min', label: '< 15 mins' },
    { id: '30min', label: '< 30 mins' },
    { id: '1hour', label: '< 1 hour' },
  ];

  return (
    <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800">
      <div className="max-w-lg mx-auto px-4 py-3">
        {/* Search Input */}
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Search rooms..."
              className="w-full bg-gray-800 text-gray-100 pl-10 pr-4 py-2.5 rounded-lg 
                       border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500
                       transition-all duration-200"
            />
            <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            {value && (
              <button
                onClick={() => onChange('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 bg-gray-800 rounded-lg border transition-colors ${
              showFilters ? 'border-cyan-500 text-cyan-500' : 'border-gray-700 text-gray-400 hover:border-cyan-500'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                {/* Categories */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-300">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => handleFilterChange({ category: id as RoomFilters['category'] })}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          filters.category === id
                            ? 'bg-cyan-500 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Time */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-300">Start Time</h3>
                  <div className="flex flex-wrap gap-2">
                    {timeOptions.map(({ id, label }) => (
                      <button
                        key={id}
                        onClick={() => handleFilterChange({ startTime: id as RoomFilters['startTime'] })}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          filters.startTime === id
                            ? 'bg-cyan-500 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-300">Ticket Price</h3>
                    <span className="text-sm text-gray-400">
                      ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={filters.priceRange[1]}
                    onChange={(e) => handleFilterChange({ 
                      priceRange: [0, parseInt(e.target.value)] 
                    })}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}