import { Star, Sparkles, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import type { HostStats } from '../../types/dashboard';

interface DashboardHeaderProps {
  stats: HostStats;
}

export default function DashboardHeader({ stats }: DashboardHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#FF5722] to-[#1A237E] rounded-2xl shadow-lg"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
      
      {/* Content */}
      <div className="relative z-10 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-4">
            <motion.h1 
              className="text-3xl md:text-4xl font-bold text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Welcome Back, Host!
            </motion.h1>
            <div className="flex items-center gap-6">
              <motion.div 
                className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Star className="w-5 h-5 text-[#FFD700] fill-current" />
                <span className="text-white font-semibold">{stats.rating}</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Crown className="w-5 h-5 text-[#FFD700]" />
                <span className="text-white font-medium">{stats.gamesHosted} games hosted</span>
              </motion.div>
            </div>
          </div>
          
          <motion.div 
            className="relative group"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700] to-[#FFA000] rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-75"></div>
            <div className="relative bg-gradient-to-br from-[#FFD700] to-[#FFA000] rounded-2xl p-6 transform group-hover:scale-105 transition-transform">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-5 h-5 text-[#1A237E]" />
                <span className="text-sm font-medium text-[#1A237E]">Total Earnings</span>
              </div>
              <div className="text-3xl font-bold text-[#1A237E]">
                ₹{stats.totalEarnings.toLocaleString()}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}