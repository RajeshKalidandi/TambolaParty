import { useEffect, useState } from 'react';
import { Calendar, Users, TrendingUp, IndianRupee } from 'lucide-react';
import type { HostStats } from '../../types/dashboard';
import { supabase } from '../../lib/supabase';

interface StatisticsGridProps {
  initialStats: HostStats;
}

export default function StatisticsGrid({ initialStats }: StatisticsGridProps) {
  const [stats, setStats] = useState<HostStats>(initialStats);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const subscription = supabase
      .channel('host_stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'host_stats'
        },
        async () => {
          await fetchStats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('host_stats')
        .select('*')
        .single();

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      icon: Calendar,
      label: "Today's Games",
      value: stats.todayGames,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Users,
      label: 'Active Players',
      value: stats.activePlayers,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      icon: TrendingUp,
      label: 'Success Rate',
      value: `${stats.successRate}%`,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: IndianRupee,
      label: 'Total Earnings',
      value: `₹${stats.totalEarnings}`,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className={`${card.bg} p-3 rounded-lg`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">{card.label}</h3>
              {loading ? (
                <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}