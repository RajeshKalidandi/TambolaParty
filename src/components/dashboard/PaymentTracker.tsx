import { useEffect, useState } from 'react';
import { Trophy, Filter, Clock, Medal } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface GameWin {
  id: string;
  game_id: string;
  room_name: string;
  prize_type: 'full_house' | 'top_line' | 'middle_line' | 'bottom_line' | 'early_five';
  prize_amount: number;
  timestamp: string;
}

type FilterType = 'ALL' | 'FULL_HOUSE' | 'LINES' | 'EARLY_FIVE';

export default function WinningsTracker() {
  const [wins, setWins] = useState<GameWin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });

  useEffect(() => {
    loadWins();
    
    const subscription = supabase
      .channel('game_wins')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_wins'
      }, () => {
        loadWins();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [filterType, dateRange]);

  const loadWins = async () => {
    try {
      let query = supabase
        .from('game_wins')
        .select(`
          id,
          game_id,
          room_name,
          prize_type,
          prize_amount,
          timestamp
        `)
        .order('timestamp', { ascending: false });

      if (filterType !== 'ALL') {
        if (filterType === 'LINES') {
          query = query.in('prize_type', ['top_line', 'middle_line', 'bottom_line']);
        } else if (filterType === 'FULL_HOUSE') {
          query = query.eq('prize_type', 'full_house');
        } else {
          query = query.eq('prize_type', 'early_five');
        }
      }

      if (dateRange.start) {
        query = query.gte('timestamp', dateRange.start.toISOString());
      }
      if (dateRange.end) {
        query = query.lte('timestamp', dateRange.end.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setWins(data || []);
    } catch (error) {
      console.error('Error loading wins:', error);
      toast.error('Failed to load winning history');
    } finally {
      setLoading(false);
    }
  };

  const getTotalWinnings = () => {
    return wins.reduce((total, win) => total + win.prize_amount, 0);
  };

  const getWinsByType = (type: string) => {
    return wins.filter(win => win.prize_type === type).length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPrizeIcon = (type: string) => {
    switch (type) {
      case 'full_house':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'early_five':
        return <Medal className="w-5 h-5 text-blue-500" />;
      default:
        return <Trophy className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Winnings History</h2>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as FilterType)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="ALL">All Wins</option>
            <option value="FULL_HOUSE">Full House</option>
            <option value="LINES">Lines</option>
            <option value="EARLY_FIVE">Early Five</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Winnings</p>
          <p className="text-2xl font-bold text-green-600">₹{getTotalWinnings()}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Full House Wins</p>
          <p className="text-2xl font-bold text-yellow-600">{getWinsByType('full_house')}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Early Five Wins</p>
          <p className="text-2xl font-bold text-blue-600">{getWinsByType('early_five')}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-3 text-gray-600">Prize</th>
              <th className="pb-3 text-gray-600">Room</th>
              <th className="pb-3 text-gray-600">Amount</th>
              <th className="pb-3 text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-4">
                  <Clock className="w-5 h-5 animate-spin mx-auto" />
                </td>
              </tr>
            ) : wins.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  No wins found
                </td>
              </tr>
            ) : (
              wins.map((win) => (
                <tr key={win.id} className="border-b">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {getPrizeIcon(win.prize_type)}
                      <span className="capitalize">
                        {win.prize_type.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="py-3">{win.room_name}</td>
                  <td className="py-3">₹{win.prize_amount}</td>
                  <td className="py-3">{formatDate(win.timestamp)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}