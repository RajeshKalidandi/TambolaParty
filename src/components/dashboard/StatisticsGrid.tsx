import { useEffect, useState } from 'react';
import { Calendar, Users, TrendingUp, IndianRupee, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
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
      gradient: 'from-blue-500 to-blue-700',
      glowColor: 'blue',
    },
    {
      icon: Users,
      label: 'Active Players',
      value: stats.activePlayers,
      gradient: 'from-purple-500 to-purple-700',
      glowColor: 'purple',
    },
    {
      icon: TrendingUp,
      label: 'Success Rate',
      value: `${stats.successRate}%`,
      gradient: 'from-[#FF5722] to-[#FF8A65]',
      glowColor: 'orange',
    },
    {
      icon: IndianRupee,
      label: 'Total Earnings',
      value: `₹${stats.totalEarnings}`,
      gradient: 'from-[#FFD700] to-[#FFA000]',
      glowColor: 'yellow',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
    >
      {cards.map((card, index) => (
        <motion.div 
          key={card.label}
          variants={item}
          className="relative group"
        >
          {/* Glow Effect */}
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-25`}></div>
          
          {/* Card Content */}
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:transform hover:scale-105 transition-all duration-300">
            <div className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-4 mb-4 w-fit`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
            
            <h3 className="text-gray-400 text-sm mb-2">{card.label}</h3>
            
            {loading ? (
              <div className="h-8 w-24 bg-gray-200/20 animate-pulse rounded"></div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{card.value}</span>
                <Sparkles className="w-4 h-4 text-[#FFD700]" />
              </div>
            )}
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 p-2">
              <div className="w-2 h-2 rounded-full bg-white/20"></div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}