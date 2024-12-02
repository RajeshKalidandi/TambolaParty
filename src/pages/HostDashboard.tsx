import React from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import QuickActions from '../components/dashboard/QuickActions';
import StatisticsGrid from '../components/dashboard/StatisticsGrid';
import RecentActivities from '../components/dashboard/RecentActivities';
import type { HostStats, RecentActivity } from '../types/dashboard';

const MOCK_STATS: HostStats = {
  totalEarnings: 25000,
  rating: 4.8,
  gamesHosted: 42,
  todayGames: 3,
  activePlayers: 156,
  successRate: 98,
};

const MOCK_ACTIVITIES: RecentActivity[] = [
  {
    id: '1',
    type: 'game',
    title: 'Weekend Bonanza',
    description: '15 players joined',
    amount: 1200,
    timestamp: Date.now() - 3600000,
    status: 'completed',
  },
  {
    id: '2',
    type: 'withdrawal',
    title: 'UPI Withdrawal',
    description: 'To: user@upi',
    amount: 5000,
    timestamp: Date.now() - 7200000,
    status: 'pending',
  },
  {
    id: '3',
    type: 'feedback',
    title: 'Player Feedback',
    description: '"Great host, very engaging!"',
    timestamp: Date.now() - 86400000,
  },
];

export default function HostDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <DashboardHeader stats={MOCK_STATS} />
        <QuickActions />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <StatisticsGrid stats={MOCK_STATS} />
          </div>
          <div>
            <RecentActivities activities={MOCK_ACTIVITIES} />
          </div>
        </div>
      </div>
    </div>
  );
}