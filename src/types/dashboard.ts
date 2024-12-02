export interface HostStats {
  totalEarnings: number;
  rating: number;
  gamesHosted: number;
  todayGames: number;
  activePlayers: number;
  successRate: number;
}

export interface RecentActivity {
  id: string;
  type: 'game' | 'withdrawal' | 'feedback';
  title: string;
  description: string;
  amount?: number;
  timestamp: number;
  status?: 'completed' | 'pending' | 'cancelled';
}