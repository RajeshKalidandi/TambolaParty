import React from 'react';
import { Star } from 'lucide-react';
import type { HostStats } from '../../types/dashboard';

interface DashboardHeaderProps {
  stats: HostStats;
}

export default function DashboardHeader({ stats }: DashboardHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Host Dashboard</h1>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="font-semibold">{stats.rating}</span>
          </div>
          <span className="text-gray-500">|</span>
          <span className="text-gray-600">{stats.gamesHosted} games hosted</span>
        </div>
      </div>
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
        <span className="text-sm text-green-600 font-medium">Total Earnings</span>
        <div className="text-2xl font-bold text-green-700">₹{stats.totalEarnings.toLocaleString()}</div>
      </div>
    </div>
  );
}