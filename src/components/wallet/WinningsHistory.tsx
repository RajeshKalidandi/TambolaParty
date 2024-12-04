import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, ArrowRight, Trophy, Medal, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface WinningRecord {
  id: string;
  room_code: string;
  room_name: string;
  host_name: string;
  prize_type: string;
  prize_amount: number;
  created_at: string;
}

interface WinningsStats {
  totalWinnings: number;
  totalGames: number;
  highestWin: number;
  winningStreak: number;
}

export default function WinningsHistory() {
  const { user } = useAuth();
  const [winnings, setWinnings] = useState<WinningRecord[]>([]);
  const [stats, setStats] = useState<WinningsStats>({
    totalWinnings: 0,
    totalGames: 0,
    highestWin: 0,
    winningStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (user?.id) {
      void loadWinningsHistory();
      void calculateStats();

      // Subscribe to real-time updates
      const channel = supabase
        .channel('winnings_updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'player_winnings',
            filter: `player_id=eq.${user.id}`,
          },
          () => {
            void loadWinningsHistory();
            void calculateStats();
          }
        )
        .subscribe();

      return () => {
        void supabase.removeChannel(channel);
      };
    }
  }, [user?.id, currentPage]);

  const loadWinningsHistory = async () => {
    try {
      setLoading(true);
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      // Get total count
      const { count } = await supabase
        .from('player_winnings')
        .select('*', { count: 'exact', head: true })
        .eq('player_id', user?.id);

      setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));

      // Get paginated data
      const { data, error } = await supabase
        .from('player_winnings')
        .select('*')
        .eq('player_id', user?.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setWinnings(data || []);
    } catch (error) {
      console.error('Error loading winnings history:', error);
      toast.error('Failed to load winnings history');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      const { data, error } = await supabase
        .from('player_winnings')
        .select('prize_amount, created_at')
        .eq('player_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalWinnings = data.reduce((sum, win) => sum + win.prize_amount, 0);
      const highestWin = Math.max(...data.map(win => win.prize_amount));
      
      // Calculate winning streak (consecutive days with wins)
      let streak = 0;
      let currentStreak = 0;
      let lastDate: Date | null = null;

      data.forEach(win => {
        const winDate = new Date(win.created_at);
        winDate.setHours(0, 0, 0, 0);

        if (!lastDate) {
          currentStreak = 1;
        } else {
          const dayDiff = Math.floor((lastDate.getTime() - winDate.getTime()) / (1000 * 60 * 60 * 24));
          if (dayDiff === 1) {
            currentStreak++;
          } else {
            streak = Math.max(streak, currentStreak);
            currentStreak = 1;
          }
        }
        lastDate = winDate;
      });

      streak = Math.max(streak, currentStreak);

      setStats({
        totalWinnings,
        totalGames: data.length,
        highestWin,
        winningStreak: streak,
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const formatPrizeType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getPrizeIcon = (type: string) => {
    switch (type) {
      case 'full_house':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'early_five':
        return <Medal className="w-5 h-5 text-blue-500" />;
      default:
        return <Award className="w-5 h-5 text-green-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-4"
        >
          <p className="text-sm text-gray-400">Total Winnings</p>
          <p className="text-2xl font-bold text-green-500">₹{stats.totalWinnings}</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-4"
        >
          <p className="text-sm text-gray-400">Games Won</p>
          <p className="text-2xl font-bold text-blue-500">{stats.totalGames}</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-lg p-4"
        >
          <p className="text-sm text-gray-400">Highest Win</p>
          <p className="text-2xl font-bold text-yellow-500">₹{stats.highestWin}</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4"
        >
          <p className="text-sm text-gray-400">Win Streak</p>
          <p className="text-2xl font-bold text-purple-500">{stats.winningStreak} days</p>
        </motion.div>
      </div>

      {/* Winnings History */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-white mb-4">Winnings History</h3>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
          </div>
        ) : winnings.length === 0 ? (
          <div className="text-center py-10">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No winnings yet</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {winnings.map((win) => (
                <motion.div
                  key={win.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-gray-800 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      {getPrizeIcon(win.prize_type)}
                      <div>
                        <h4 className="font-medium text-white">{win.room_name}</h4>
                        <p className="text-sm text-gray-400">
                          Hosted by {win.host_name} • Room #{win.room_code}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {formatPrizeType(win.prize_type)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-500">
                        ₹{win.prize_amount}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(win.created_at)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-gray-800 disabled:opacity-50"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-gray-800 disabled:opacity-50"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
