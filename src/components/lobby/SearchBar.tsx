import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function SearchBar() {
  return (
    <div className="sticky top-0 z-20 bg-gray-900 p-4 border-b border-gray-800">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search rooms..."
            className="w-full bg-gray-800 text-gray-100 pl-10 pr-4 py-2 rounded-lg 
                     border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500
                     transition-all duration-200"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
        <button className="p-2 bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-500 transition-colors">
          <SlidersHorizontal className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );
}